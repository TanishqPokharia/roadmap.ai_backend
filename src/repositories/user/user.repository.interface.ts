import AuthResponse from "../../models/auth.response";
import DataOrError from "../../utils/data.or.error";

export default interface IUserRepository {
  signUp(
    username: string,
    email: string,
    password: string
  ): Promise<DataOrError<AuthResponse>>;
  login(email: string, password: string): Promise<DataOrError<AuthResponse>>; // default login
  login(googleIdToken: string): Promise<DataOrError<AuthResponse>>; // google OAuth login
  refresh(refreshToken: string): Promise<DataOrError<AuthResponse>>;
  uploadAvatar(userId: string, avatar: Buffer): Promise<DataOrError<string>>;
  getUserDetails(userId: string): Promise<DataOrError<UserDetails>>;
}
