var config = require("./dbconfig");
const sql = require("mssql");
 
async function getdata() {
  try {
    let pool = await sql.connect(config);
    console.log("sql server connected...");
  } catch (error) {
console.log(" mathus-error :" + error);
  }
}
 
async function getdata_withQuery(codigo) {
    try {
      let pool = await sql.connect(config);

      let codigoBeneficiario = codigo;

      let res = await pool.request().query(`DECLARE @codigo AS VARCHAR (17) = ${codigoBeneficiario}

      SELECT @codigo AS DIGITADO --CODIGO DIGITADO
         , REPLACE(LTRIM(REPLACE(@codigo, '0', ' ')),' ', '0') AS CODIGO --REMOVENDO ZEROS A ESQUERDA
         , (CASE WHEN  B.codigo =@Codigo THEN 'ATIVO' --CONVERTE RESULTADO EM STATUS
          END) AS 'STATUS'
      FROM CONTRATO C WITH (NOLOCK)
         JOIN BENEFICIARIO B	WITH (NOLOCK) ON C.AUTOID = B.CONTRATO
      WHERE B.CODIGO LIKE REPLACE(LTRIM(REPLACE(@codigo, '0', ' ')),' ', '0') -- COMPARA UM BENEFICIARIO COM O CODIGO DIGITADO SEM OS ZEROS
         AND B.AUTOID  NOT IN (SELECT SV.BENEFICIARIO
                      FROM  SUSPENSAOVINCULO AS SV
                      WHERE SV.DATAREATIVACAO IS NULL
                            AND SV.BENEFICIARIO IS NOT NULL
                            AND SV.DATASUSPENSAO <= CONVERT(DATETIME , ISNULL(GETDATE() ,SV.DATASUSPENSAO) , 103)
                          AND SV.VINCULORESCINDIDO = '1' )
         AND C.AUTOID  NOT IN (SELECT CONTRATO
                      FROM SUSPENSAOVINCULO AS SV
                      WHERE DATAREATIVACAO IS NULL
                      AND CONTRATO IS NOT NULL
                      AND SV.DATASUSPENSAO <= CONVERT(DATETIME , ISNULL(GETDATE() , SV.DATASUSPENSAO) , 103) 
                      AND SV.VINCULORESCINDIDO = '1' )`);
      return res.recordsets;
    } catch (error) {
      console.log(" mathus-error :" + error);
    }
  }
  
module.exports = {
  getdata: getdata,
  getdata_withQuery:getdata_withQuery
};
