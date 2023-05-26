import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';

import {CreateUserDto, UpdateAuthDto, LoginDto, RegisterDto } from './dto';

// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) private userModel: Model<User>,
    private jwtSetvice: JwtService
  ) {

  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log(createUserDto);
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
      console.log(error.code);
      if(error.code === 11000) {
        throw new BadRequestException(`${ createUserDto.email } already exist`);
      }

      throw new InternalServerErrorException(`Something terrible happened`);
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create({ email: registerDto.email, name: registerDto.name, password: registerDto.password });

    console.log(user);

    return {
      user: user,
      token: this.getJwt({ id: user._id })
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    
    if(!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if(!bcryptjs.compareSync( password, user.password )) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwt({ id: user.id })
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);

    const { password, ...rest} = user.toJSON();

    return rest;
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

  getJwt(payload: JwtPayload) {
    const token = this.jwtSetvice.sign(payload);

    return token;
  }
}
