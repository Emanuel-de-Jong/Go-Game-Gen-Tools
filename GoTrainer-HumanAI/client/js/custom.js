var custom = {};


custom.THEME_TYPES = {
    DARK: 0,
    LIGHT: 1,
};


custom.init = function () {
    custom.htmlElement = document.getElementsByTagName("html")[0];

    custom.darkThemeSwitch = document.getElementById("darkThemeSwitch");
    if (custom.darkThemeSwitch) {
        custom.darkThemeSwitch.addEventListener("input", custom.darkThemeSwitchInputListener);
    }

    custom.themeChangedEvent = new CEvent();

    custom.theme = custom.THEME_TYPES.DARK;
};


custom.darkThemeSwitchInputListener = function () {
    if (custom.darkThemeSwitch.checked) {
        custom.enableDarkTheme();
    } else {
        custom.disableDarkTheme();
    }

    custom.themeChangedEvent.dispatch({ theme: custom.theme });
};

custom.enableDarkTheme = function () {
    custom.theme = custom.THEME_TYPES.DARK;
    custom.htmlElement.dataset.bsTheme = "dark";
};

custom.disableDarkTheme = function () {
    custom.theme = custom.THEME_TYPES.LIGHT;
    custom.htmlElement.dataset.bsTheme = "light";
};
