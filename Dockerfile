FROM node:latest
WORKDIR /usr/src/app
EXPOSE 8080
# CMD ["/bin/bash"]
CMD ["node", "server.js"]
