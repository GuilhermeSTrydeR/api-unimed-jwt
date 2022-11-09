const express = require('express');
const app = express();
const port = 3000;

//usuario que acessara essa API implementar isso
const user = 'univers';
const password = '1020304050';
const sql = require("./dboperation.js");
const bodyParser = require('body-parser');
const { json } = require('body-parser');

//java web token,responsavel pela geracao e validacao dos tokens
const jwt = require('jsonwebtoken');
const blacklist = [];

//tempo de vida do token
const tempoToken = '300000';
const date = new Date();

//aqui sera gerado uma string aleatoria para ser a chave secreta dessa requisicao caso seja necessario a chave ser aleatoria
const  generateRandomString = (num) => {
    const characters =',<.>;:/?çABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%¨&*()_+';
    let result1= Math.random().toString(36).substring(0,num);       

    return result1;
}
//const SECRET = 'nhjmNHJM<>,.;:/?';
const SECRET = toString(generateRandomString(15));

app.use(bodyParser.json());

// essa funcao que vai funcionar como uma middle-function servira para verificar se o token JWT eh legitimo e nao foi alterado, caso foi alterado qualquer informacao, aqui ele sera invalidado, ou tambem se tiver na blacklist.
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

    res.json({ msg: 'API Online!'});

})

//nessa rota eh feita a geracao do token para o usuario a partir do usuario e senha que ele informou, caso o usuario ou senha seja divergente eh retornado status 401.
//no jwt.sign, o primeiro parametro eh o usuario q vai ser validado, no caso esta fixo, o segundo parametro eh o segredo que vai ser incorporado no JWT e o ultimo eh em quanto tempo esse token vai expirar(em segundos)
app.post('/login', (req, res) => {
    if(req.headers.user === user && req.headers.password === password){
        const token = jwt.sign({userId: 1}, SECRET, {expiresIn: tempoToken})
        return res.json({auth: true, token});
    }
    else{
        return res.json({erro: 'usuario ou senha invalidos!'});
    }
    
})

//nessa rota eh feita a consulta se o beneficiario esta ativo ou nao, eh necessario ser enviado no cabecalho o token gerado na rota /login, no entanto o cabecalho sera: header: 'x-access-token' value '[token gerado]' caso contrario nao sera permitida a consulta, ou se o token estiver na blacklist tbm sera negado, obs: o token entra na blacklist quando ele eh enviado por cabecalho 'x-access-token' na rota /logout.
app.post('/query', verifyJWT, (req, res) => {

    
        sql.getdata_withQuery(req.body.codigo).then((result) => {
                    
            rows = result[0].length;

                    if(rows >= 1){
                        res.send({
                            "CODIGO" : req.body.codigo,
                            "STATUS" : "ATIVO"
                        });
                    }
                    else{
                    
                        /* res.send(401, {
                            "CODIGO" : req.body.codigo,
                            "STATUS" : "INATIVO OU CODIGO INVALIDO!"
                        }); */
                        res.send({
                            "CODIGO" : req.body.codigo,
                            "STATUS" : "INATIVO"
                        }); 

                    }

                 /*    res.json(result[0].reduce(p => {
                        //apos recebido os dados via corpo de requisicao na funcao, eh criado um JSON para retornar mais abaixo as informacoes no endpoint
                        
                        let jsonResult = {
                            "codigo" : p.CODIGO,
                            "status" : p.STATUS
                        }
                        
                    }));   */    

                    console.log("Linhas do banco: "+rows+" data: "+result);
        });
       
        
        
})

//rota simples para deslogar um usuario do sistema, porem deve ser enviado por cabecalho 'x-access-token' o token para ser deslogado e com isso esse token entrara na blacklist nao podendo ser reutilizado, obs: a blacklist eh dinamica, ou seja nao eh armazenada em nenhum lugar apenas uma variavel, ao reiniciar o servidor essa blacklist eh apagada.
app.post('/logout', function (req, res) {
    blacklist.push(req.headers['x-access-token']);
    res.send({
        "TOKEN" : req.headers['x-access-token'],
        "STATUS" : "DESATIVADO"
    }); 
})

//abaixo esta definida a porta que o servidor vai subir, obs: CLI -> 'node index.js' para subir o servidor tanto no windows quanto no linux
app.listen(port, () => {
    console.log(`Aplicativo rodando na porta: ${port}`);
})
