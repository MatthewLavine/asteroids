FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY index.html .
COPY *.js .
COPY *.css .
COPY sounds/ sounds/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
