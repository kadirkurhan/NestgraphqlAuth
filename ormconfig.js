require('dotenv').config();
module.exports = {
    type: 'postgres',
    host: "buacidalotgr17algey3-postgresql.services.clever-cloud.com",
    port: 5432,
    username: "usbjtk28bvxzfutl2zql",
    password: "C0MsqnLesqlhV0OmGoEs",
    database: "buacidalotgr17algey3",
    synchronize: true,
    dropSchema: false,
    logging: true,
    entities: ['dist/**/*.entity.js'],
};
