import { Notification } from "domain/entities/Notification";
import { FutureData } from "domain/entities/generic/Future";

export interface NotificationsRepository {
    send(notification: Notification): FutureData<void>;
}
