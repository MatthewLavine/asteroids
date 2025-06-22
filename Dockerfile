FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY index.html .
COPY *.js .
COPY *.css .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
