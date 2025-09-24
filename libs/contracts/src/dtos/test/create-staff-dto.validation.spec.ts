import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateStaffDto } from '@app/contracts';

describe('CreateStaffDto Validation Tests', () => {
  const validateDto = async (dto: any) => {
    const object = plainToClass(CreateStaffDto, dto);
    const errors = await validate(object);
    return errors;
  };

  it('should pass validation with valid required fields', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    console.log(typeof errors, errors);
    expect(errors).toHaveLength(0);
  });

  it('should fail when fullName is missing', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'j@example.com',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    console.log(typeof errors, errors);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'fullName')).toBe(true);
  });

  it('should fail when email is missing', async () => {
    const dto = {
      fullName: 'John Doe',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('should fail when password is missing', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('should fail when fullName is too short', async () => {
    const dto = {
      fullName: 'J',
      email: 'john.doe@example.com',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('fullName');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail when fullName is too long', async () => {
    const dto = {
      fullName: 'a'.repeat(101),
      email: 'john.doe@example.com',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('fullName');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail with invalid email format', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'invalid-email',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail when password is too short', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Pass1',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail when password lacks complexity', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should pass when optional fields are not provided', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
    };

    const errors = await validateDto(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate role when provided', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      role: 'DOCTOR',
    };

    const errors = await validateDto(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid role', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      role: 'INVALID_ROLE',
    };

    const errors = await validateDto(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });
});
