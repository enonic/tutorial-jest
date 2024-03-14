export const getAppConfig = () => {
    log.debug('getAppConfig() called');
    const config = app.config;
    log.info('App config:%s', config);
    return config;
};
