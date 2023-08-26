import { MongoClient, Db } from 'mongodb';

export default class Database {

    #CONN_STR: string
    #DB_NAME: string
    #client: MongoClient

    constructor(){
        this.#CONN_STR = process.env.MONGO_CONN_STR!;
        this.#DB_NAME = process.env.MONGO_DB_NAME!;
        this.#client = new MongoClient(this.#CONN_STR);
        this._connect();
    }

    async _connect(){
        if(this.#CONN_STR && this.#DB_NAME){
            await this.#client.connect();
            console.log("Mongo connected");
        }
    }

    getDb(){
        return this.#client.db(this.#DB_NAME);    
    }

    async disconnect(){

    }

}