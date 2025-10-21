export const getRouteByUserIdAndDay = (user: any, day: string) => {
  return user.routes.find((route: any) => route.route.day === day);
};