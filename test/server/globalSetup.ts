function globalSetup(globalConfig, projectConfig) {
    projectConfig.globals.log = {
        debug: globalThis.console.debug,
        info: globalThis.console.info,
        error: globalThis.console.error,
        warning: globalThis.console.warn
    }
}

export default globalSetup;

