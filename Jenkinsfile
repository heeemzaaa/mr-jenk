pipeline {
    agent none

    environment {
        BACKEND_BUILD_IMAGE = 'maven:3.9-eclipse-temurin-17'
        FRONTEND_BUILD_IMAGE = 'node:20-alpine'
        MONGO_IMAGE         = 'mongo:7'
        CI_NETWORK_PREFIX      = "backend-ci-${BUILD_NUMBER}"
        MONGO_CONTAINER_PREFIX = "mongo-${BUILD_NUMBER}"
        CI_KEYSTORE_PASSWORD = 'changeit-ci'
    }

    stages {
        stage('Build: Backend Services') {
            parallel {
                stage('discovery-server') {
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('discovery-server') {
                            sh 'mvn -B -DskipTests clean package'
                        }
                    }
                }
                stage('user-service') {
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('user-service') {
                            sh 'mvn -B -DskipTests clean package'
                        }
                    }
                }
                stage('product-service') {
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('product-service') {
                            sh 'mvn -B -DskipTests clean package'
                        }
                    }
                }
                stage('media-service') {
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('media-service') {
                            sh 'mvn -B -DskipTests clean package'
                        }
                    }
                }
                stage('api-gateway') {
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('api-gateway') {
                            sh 'mvn -B -DskipTests clean package'
                        }
                    }
                }
            }
        }

        stage('Build: Frontend') {
            agent {
                docker {
                    image "${FRONTEND_BUILD_IMAGE}"
                }
            }
            steps {
                checkout scm
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Test: Backend Services') {
            parallel {
                stage('discovery-server') {
                    // No datastore dependency — mirrors the GitHub Actions workflow
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    steps {
                        checkout scm
                        dir('discovery-server') {
                            sh 'mvn -B verify'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'discovery-server/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('user-service') {
                    agent any
                    steps {
                        checkout scm
                        script {
                            def network = "${CI_NETWORK_PREFIX}-user"
                            def mongoName = "${MONGO_CONTAINER_PREFIX}-user"

                            sh "docker network create ${network}"
                            try {
                                docker.image("${MONGO_IMAGE}").withRun("--name ${mongoName} --network ${network} --rm") {
                                    docker.image("${BACKEND_BUILD_IMAGE}").inside(
                                        "--network ${network} " +
                                        "-e MONGODB_URI=mongodb://${mongoName}:27017/users_db " +
                                        "-v maven-repo:/root/.m2"
                                    ) {
                                        dir('user-service') {
                                            sh 'mvn -B clean verify'
                                        }
                                    }
                                }
                            } finally {
                                sh "docker network rm ${network} || true"
                            }
                        }
                    }
                    post {
                        always {
                            junit testResults: 'user-service/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('product-service') {
                    agent any
                    steps {
                        checkout scm
                        script {
                            def network = "${CI_NETWORK_PREFIX}-product"
                            def mongoName = "${MONGO_CONTAINER_PREFIX}-product"

                            sh "docker network create ${network}"
                            try {
                                docker.image("${MONGO_IMAGE}").withRun("--name ${mongoName} --network ${network} --rm") {
                                    docker.image("${BACKEND_BUILD_IMAGE}").inside(
                                        "--network ${network} " +
                                        "-e MONGODB_URI=mongodb://${mongoName}:27017/products_db " +
                                        "-v maven-repo:/root/.m2"
                                    ) {
                                        dir('product-service') {
                                            sh 'mvn -B clean verify'
                                        }
                                    }
                                }
                            } finally {
                                sh "docker network rm ${network} || true"
                            }
                        }
                    }
                    post {
                        always {
                            junit testResults: 'product-service/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('media-service') {
                    agent any
                    steps {
                        checkout scm
                        script {
                            def network = "${CI_NETWORK_PREFIX}-media"
                            def mongoName = "${MONGO_CONTAINER_PREFIX}-media"

                            sh "docker network create ${network}"
                            try {
                                docker.image("${MONGO_IMAGE}").withRun("--name ${mongoName} --network ${network} --rm") {
                                    docker.image("${BACKEND_BUILD_IMAGE}").inside(
                                        "--network ${network} " +
                                        "-e MONGODB_URI=mongodb://${mongoName}:27017/media_db " +
                                        "-v maven-repo:/root/.m2"
                                    ) {
                                        dir('media-service') {
                                            sh 'mvn -B clean verify'
                                        }
                                    }
                                }
                            } finally {
                                sh "docker network rm ${network} || true"
                            }
                        }
                    }
                    post {
                        always {
                            junit testResults: 'media-service/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
                stage('api-gateway') {
                    // Needs a keystore on the classpath before Spring can even
                    // start — SSL_KEYSTORE_PASSWORD has no default, unlike the
                    // other services' env vars
                    agent {
                        docker {
                            image "${BACKEND_BUILD_IMAGE}"
                            args '-v maven-repo:/root/.m2'
                        }
                    }
                    environment {
                        SSL_KEYSTORE_PASSWORD = "${CI_KEYSTORE_PASSWORD}"
                    }
                    steps {
                        checkout scm
                        dir('api-gateway') {
                            sh '''
                                keytool -genkeypair \
                                  -alias gateway \
                                  -keyalg RSA -keysize 2048 \
                                  -storetype PKCS12 \
                                  -keystore src/main/resources/keystore.p12 \
                                  -validity 3650 \
                                  -dname "CN=localhost, OU=CI, O=Vendify" \
                                  -storepass "$SSL_KEYSTORE_PASSWORD" \
                                  -keypass "$SSL_KEYSTORE_PASSWORD"
                                mvn -B verify
                            '''
                        }
                    }
                    post {
                        always {
                            junit testResults: 'api-gateway/target/surefire-reports/*.xml', allowEmptyResults: true
                        }
                    }
                }
            }
        }
    }
}
    