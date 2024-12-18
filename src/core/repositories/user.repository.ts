import { User } from "../entities/user.entitiy";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
    create(user:User):Promise<User>;
    findByEmail(email:string):Promise<User|null>;
    update(userId:string,updates:Partial<User>):Promise<User>;
    findById(userId:string):Promise<User>;
}