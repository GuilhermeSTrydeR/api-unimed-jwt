const express = require('express');
const app = express();
const port = 3000;
const sql = require("./dboperation.js");
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const jwt = require('jsonwebtoken');
const blacklist = [];

//chave secreta incorporada ao JWT
const SECRET = 'qpwoalskfdj';

app.use(bodyParser.json());

// essa middle-function servira para verificar se o token JWT eh legitimo e nao foi alterado, caso foi alterado qualquer informacao, aqui ele sera invalidado, ou tambem se tiver na blacklist.
function verifyJWT(req, res, next){
    const token = req.headers['x-access-token'];
    const index = blacklist.findIndex(item => item === token);

    //se caso o token que vai ser validado nessa funcao estiver na blacklist, eh retornado status 401, impedindo de prosseguir.
    if(index !== -1){
        return res.status(401).end();
    }
    jwt.verify(token, SECRET, (err, decoded) => {
        if(err) return res.status(401).end();
        req.userId = decoded.userId;
        next();
    })
}

//rota para informar apenas se a API esta online
app.get('/', (req, res) => {
    res.json({ message: "Tudo Rodando OK!"});
})

//nessa rota eh feita a geracao do token para o usuario a partir do usuario e senha que ele informou, caso o usuario ou senha seja divergente eh retornado status 401.
app.post('/login', (req, res) => {
    if(req.body.user === 'teste' && req.body.password === '12345'){
        const token = jwt.sign({userId: 1}, SECRET, {expiresIn: 600})
        return res.json({auth: true, token});
    }
    res.status(401).end();
})

//nessa rota eh feita a consulta se o beneficiario esta ativo ou nao, eh necessario ser enviado no cabecalho o token gerado na rota /login, no entanto o cabecalho sera: header: 'x-access-token' value '[token gerado]' caso contrario nao sera permitida a consulta, ou se o token estiver na blacklist tbm sera negado, obs: o token entra na blacklist quando ele eh enviado por cabecalho 'x-access-token' na rota /logout.
app.get('/query', verifyJWT, (req, res) => {
    sql.getdata_withQuery(req.body.codigo).then((result) => {
        res.json(result[0].map(p => {
            //apos recebido os dados via corpo de requisicao na funcao, eh criado um JSON para retornar mais abaixo as informacoes no endpoint
            let jsonResult = {
                "codigo" : p.CODIGO,
                "status" : p.STATUS
            }
            //aqui eh o retorno da funcao que contem o JSON 
            return jsonResult;
        }));
    });
})


//rota simples para deslogar um usuario do sistema, porem deve ser enviado por cabecalho 'x-access-token' o token para ser deslogado e com isso esse token entrara na blacklist nao podendo ser reutilizado, obs: a blacklist eh dinamica, ou seja nao eh armazenada em nenhum lugar apenas uma variavel, ao reiniciar o servidor essa blacklist eh apagada.
app.post('/logout', function (req, res) {
    blacklist.push(req.headers['x-access-token']);
    res.send("Usuário deslogado!")
    res.end();
})

//abaixo esta definida a porta que o servidor vai subir, obs: 'node index.js' para subir o servidor
app.listen(port, () => {
    console.log(`Aplicativo rodando na porta: ${port}`);
})
