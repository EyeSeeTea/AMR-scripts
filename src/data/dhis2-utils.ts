import { HttpResponse } from "@eyeseetea/d2-api/api/common";
import { EventsPostResponse } from "@eyeseetea/d2-api/api/events";
import { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";
import { Id } from "domain/entities/Base";
import _ from "./../domain/entities/generic/Collection";
import { MetadataResponse } from "../types/d2-api";
import log from "utils/log";

export function getErrorFromResponse(res: MetadataResponse): string {
    console.debug(JSON.stringify(res, null, 4));

    const responseTypeReports = res.typeReports || [];

    const errors = responseTypeReports
        .flatMap(typeReport => typeReport.objectReports || [])
        .flatMap(objectReport => objectReport.errorReports || [])
        .flatMap(errorReport => errorReport.message);

    return _(errors).compact().uniq().join("\n");
}

export async function runMetadata(
    d2Response: CancelableResponse<MetadataResponse>
): Promise<MetadataResponse> {
    const res = await d2Response.getData();
    return res.status !== "OK" ? Promise.reject(getErrorFromResponse(res)) : Promise.resolve(res);
}

export function getData<T>(d2Response: CancelableResponse<T>): Promise<T> {
    return d2Response.getData();
}

export function checkPostEventsResponse(res: HttpResponse<EventsPostResponse>): void {
    const importMessages = _(res.response.importSummaries || [])
        .map(importSummary =>
            importSummary.status !== "SUCCESS"
                ? _([
                      importSummary.description,
                      ...importSummary.conflicts.map(c => JSON.stringify(c)),
                  ])
                      .compact()
                      .join("\n")
                : null
        )
        .compact()
        .value();

    if (res.status !== "OK") {
        const msg =
            [`POST /events error`, res.message, ...importMessages].join("\n") || "Unknown error";
        log.error(msg);
    }
}

export async function getInChunks<T>(
    ids: Id[],
    getter: (idsGroup: Id[]) => Promise<T[]>
): Promise<T[]> {
    const objsCollection = await promiseMap(_(ids).chunk(300).value(), idsGroup =>
        getter(idsGroup)
    );
    return _(objsCollection).flatten().value();
}

export function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const reducer = (acc$: Promise<S[]>, inputValue: T): Promise<S[]> =>
        acc$.then((acc: S[]) =>
            mapper(inputValue).then(result => {
                acc.push(result);
                return acc;
            })
        );
    return inputValues.reduce(reducer, Promise.resolve([]));
}
