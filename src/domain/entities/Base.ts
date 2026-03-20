import _ from "./generic/Collection";
import { HashMap } from "./generic/HashMap";
export type Id = string;
export type Ref = { id: Id };
export type NamedRef = { id: Id; name: string };

export type Path = string;
export type Username = string;

export type IndexedById<T> = Record<Id, T>;

export function getId<Obj extends Ref>(obj: Obj): Id {
    return obj.id;
}

export function indexById<T extends Ref>(objs: T[]): HashMap<Id, T> {
    return _(objs).keyBy(getId);
}

export type Code = string;
export type Name = string;

export type Identifiable = Id | Code | Name;
