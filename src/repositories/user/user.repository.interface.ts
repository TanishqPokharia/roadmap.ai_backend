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
  getUserDetails(userId: string): Promise<DataOrError<{ username: string; email: string; avatarUrl?: string | null }>>;
}
