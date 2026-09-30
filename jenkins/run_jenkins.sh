docker build -t my-jenkins .

docker run -d --name jenkins -p 8085:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock -u root my-jenkins

