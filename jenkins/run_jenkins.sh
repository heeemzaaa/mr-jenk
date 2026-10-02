#!/bin/sh

cd "$(dirname "$0")"

systemctl --user start podman.socket

DOCKER_SOCK=/run/user/$(id -u)/podman/podman.sock

docker build -t my-jenkins .

docker run -d --name jenkins \
    -p 8085:8080 -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    -v $DOCKER_SOCK:/var/run/docker.sock \
    -u root \
    my-jenkins


docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword