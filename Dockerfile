FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY dist/ .
COPY sounds/ sounds/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
