FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update && apt-get install -y docker.io

USER jenkins

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt



