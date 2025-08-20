import { Response } from "express";

export const clearAuthCookies = (res: Response) => {

  // res.cookie("access", "", {
  //     httpOnly: true,
  //     expires: new Date(0), // force immediate expiration
  // }) //same thing
 
  res.clearCookie("access", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.clearCookie("refresh", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

};
