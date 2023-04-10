#!/bin/bash

docker run -d --name rabbitmq \
 -p 5672:5672 \
 -p 15672:15672 \
 --restart=always \
 --hostname rabbitmq \
 -v /home/Rodrigo/database/rabbitmq/data:/var/lib/rabbitmq \
 rabbitmq:3-management-alpine


docker run -d --name redis-Atendimentos \
 -p 6378:6379 \
 --restart=always \
 --hostname redis-Atendimentos \
 -v /home/Rodrigo/database/redis-Atendimentos/data:/var/lib/rabbitmq \
 redis:latest


