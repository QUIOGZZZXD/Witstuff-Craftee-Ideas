import cron from "node-cron";
import { environment } from "../constants/environment.js";

export const keepAlive = async () => {
	cron.schedule("*/14 * * * *", async () => {
		try {
			const response = await fetch(`${environment.SERVICE_URL}/hello-world`);
			console.log(`Service is up. Status code: ${response.status}`);
		} catch (error) {
			console.error(`Failed to ping the service: ${error.message}`);
		}
	});
};
