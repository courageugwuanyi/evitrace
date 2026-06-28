import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cuw0XVNx.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.functions-B1I7p-if.js
var notificationPayloadSchema = objectType({
	userId: stringType().uuid(),
	type: enumType([
		"feedback",
		"auto_capture",
		"objective",
		"assessment"
	]),
	title: stringType().min(1),
	description: stringType().min(1)
});
var sendNotification = createServerFn({ method: "POST" }).validator(notificationPayloadSchema).handler(createSsrRpc("a08a152c2d4a3293332d4e735611728773caeec6ad91668c0a386481403b6f9d"));
//#endregion
export { sendNotification as t };
