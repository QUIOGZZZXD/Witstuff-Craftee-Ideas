const pageGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user) return res.redirect("/login");
    if (allowedRoles.length && !allowedRoles.includes(user.role) && !allowedRoles.includes("*")) {
      return res.redirect("/redirect");
    }

    next();
  };
};

const isGuest = async (req, res, next) => {
  const user = req.session?.user;
  
  console.log(user)
  if (!user) {
    return next();
  } else {
    res.redirect("/redirect");
  }
};

export { pageGuard, isGuest };
