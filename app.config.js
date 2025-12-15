const { version } = require("./package.json")

export default () => ({
	expo: {
		name: "appFiscal",
		slug: "appFiscal",
		version,
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "appfiscal",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		splash: {
			image: "./assets/images/splash-icon.png",
			resizeMode: "contain",
			backgroundColor: "#ffffff",
		},
		ios: {
			supportsTablet: true,
		},
		android: {
			versionCode: parseInt(version.split(".").join("")),
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
			package: "com.gabrielsouza.appFiscal",
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		plugins: [
			[
				"expo-splash-screen",
				{
					backgroundColor: "#FFFFFF",
					image: "./assets/images/splash-icon-dark.png",
					dark: {
						image: "./assets/images/splash-icon-dark.png",
						backgroundColor: "#000000",
					},
				},
			],
			"expo-router",
			"expo-sqlite",
			[
				"expo-camera",
				{
					cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
					microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
					recordAudioAndroid: true,
				},
			],
			[
				"expo-image-picker",
				{
					photosPermission:
						"The app accesses your photos to let you share them with your friends.",
				},
			],
			[
				"expo-media-library",
				{
					photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
					savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
					isAccessMediaLocationEnabled: true,
				},
			],
			[
				"expo-location",
				{
					locationAlwaysAndWhenInUsePermission:
						"Allow $(PRODUCT_NAME) to use your location.",
				},
			],
			[
				"expo-screen-orientation",
				{
					initialOrientation: "DEFAULT",
				},
			],
		],
		extra: {
			eas: {
				projectId: "644659b2-5220-498c-876a-7209dca12251",
			},
		},
		experiments: {
			typedRoutes: true,
		},
		owner: "gabrielsouza",
	},
})
