@echo off
color c
start chrome 127.0.0.1:3000
REM o modo abaixo serve para rodar sem suporte a auto-atualizacao(sem nodemon) 
REM node index.js
REM o modo abaixo cada atualizacao no codigo ira atualizar sem precisar parar e inicia ro server
REM nodemon