import { D2Api, MetadataPick } from "@eyeseetea/d2-api/2.36";
import { User } from "domain/entities/User";
import { UserRepository } from "domain/repositories/UserRepository";
import { apiToFuture } from "data/api-futures";

export class UserD2Repository implements UserRepository {
    constructor(private api: D2Api) {}

    getCurrent() {
        const response = this.api.currentUser.get({ fields: userFields });
        return apiToFuture(response).map(data => this.buildUser(data));
    }

    private buildUser(d2User: D2User) {
        return new User({
            id: d2User.id,
            name: d2User.displayName,
            userGroups: d2User.userGroups,
            ...d2User.userCredentials,
        });
    }
}

const userFields = {
    id: true,
    displayName: true,
    userGroups: { id: true, name: true },
    userCredentials: {
        username: true,
        userRoles: { id: true, name: true, authorities: true },
    },
} as const;

type D2User = MetadataPick<{ users: { fields: typeof userFields } }>["users"][number];
