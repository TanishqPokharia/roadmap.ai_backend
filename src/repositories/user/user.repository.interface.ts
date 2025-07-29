import AuthResponse from "../../models/auth.response";
import DataOrError from "../../utils/either";

export default interface IUserRepository {
  signUp(
    username: string,
    email: string,
    password: string
  ): Promise<DataOrError<AuthResponse>>;
  login(email: string, password: string): Promise<DataOrError<AuthResponse>>;
  refresh(refreshToken: string): Promise<DataOrError<AuthResponse>>;
  uploadAvatar(userId: string, avatar: Buffer): Promise<DataOrError<string>>;
}
