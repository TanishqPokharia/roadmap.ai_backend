import bcrypt from "bcrypt";

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(1);
  const hashedPass = bcrypt.hash(password, salt);
  return hashedPass;
};

export default hashPassword;
