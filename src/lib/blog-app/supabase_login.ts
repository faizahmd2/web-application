import { supabase } from "./supabase";
import bcrypt from 'bcryptjs';

export const userOperations = {
  async createUser(username: string, password: string, name: string) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const { data, error } = await supabase
        .from("users")
        .insert([{ username, password: hashedPassword, name }]);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  async verifyUser(username: string, password: string) {
    try {
      // Fetch user from Supabase based on username
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
