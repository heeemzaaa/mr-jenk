#!/bin/sh

cd "$(dirname "$0")"

systemctl --user start podman.socket

DOCKER_SOCK=/run/user/$(id -u)/podman/podman.sock

# Jenkins home must live at the SAME absolute path on the host and in the
# container: pipeline `docker { }` agents bind-mount the workspace path through
# the host's podman socket, so that path has to exist on the host too.
JENKINS_HOME_DIR="$HOME/jenkins_home"
mkdir -p "$JENKINS_HOME_DIR"

# One-time migration from the old named volume, if it exists and the dir is empty
if [ -z "$(ls -A "$JENKINS_HOME_DIR")" ] && docker volume exists jenkins_home 2>/dev/null; then
    cp -a "$(docker volume inspect jenkins_home --format '{{.Mountpoint}}')/." "$JENKINS_HOME_DIR/"
fi

docker build -t my-jenkins .

docker run -d --name jenkins \
    -p 8085:8080 -p 50000:50000 \
    -v "$JENKINS_HOME_DIR":"$JENKINS_HOME_DIR" \
    -e JENKINS_HOME="$JENKINS_HOME_DIR" \
    -v $DOCKER_SOCK:/var/run/docker.sock \
    -u root \
    my-jenkins
