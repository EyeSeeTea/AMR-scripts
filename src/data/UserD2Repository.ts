import { D2Api, MetadataPick } from "@eyeseetea/d2-api/2.36";
import { Async } from "domain/entities/Async";
import { UserRepository } from "domain/repositories/UserRepository";
import { User } from "domain/entities/User";

export class UserD2Repository implements UserRepository {
    constructor(private api: D2Api) {}
    async getCurrent(): Async<User> {
        const response = await this.api.currentUser
            .get({
                fields: userFields,
            })
            .getData();

        return this.buildUser(response);
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
