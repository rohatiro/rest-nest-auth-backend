import { BadRequestException, Injectable, InternalServerErrorException, UnsupportedMediaTypeException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) private userModel: Model<User>
  ) {

  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      
      // 1 - Encriptar la contraseña
      
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      // 2 - Guardar el UnsupportedMediaTypeException
      // 3 - Generar el JWT (Token de acceso)

      await newUser.save();

      const { password:_, ...user } = newUser.toJSON();

      return user;
    }
    catch ( error ) {
      if(error.code === 11000) {
        throw new BadRequestException(`${ createUserDto.email } already exist`);
      }

      throw new InternalServerErrorException(`Something terrible happened`);
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
