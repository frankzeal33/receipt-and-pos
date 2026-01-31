// Browser-and-mobile only middleware
export const browserMobileOnlyMiddleware = (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const blockedAgents = /(PostmanRuntime|curl|Insomnia|httpie|python-requests|SwaggerUI)/i;
    if (process.env.NODE_ENV === "production") {
        if (blockedAgents.test(userAgent)) {
            const message = "Requests allowed only from browsers";
            res.status(403);
            res.locals.message = message;
            throw new Error(message);
        }
    }
    next();
};
