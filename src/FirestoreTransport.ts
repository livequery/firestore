import { Transporter, QueryOption, QueryStream } from '@livequery/types'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentData, Firestore, QuerySnapshot, collection, deleteDoc, doc, onSnapshot, query, setDoc } from "firebase/firestore";


export type FirestoreTransportConfig = {
    database: Firestore
}

export class FirestoreTransport implements Transporter {

    constructor(
        private config: FirestoreTransportConfig
    ) { }


    #build_query_filters<T>() {
        const filters = []
        return filters
    }

    #map_query_response<T>(
            ) {
        return {} as any as QueryStream<T>
    }

    query<T extends { id: string }>(ref: string, options?: Partial<QueryOption<T>>) {

        const $query = query(
            collection(this.config.database, ref),
            ...this.#build_query_filters(options)
        )

        const o = new Observable<QuerySnapshot<DocumentData>>(
            o => onSnapshot($query, o)
        ).pipe(
            map(
                (data, index) => this.#map_query_response(data, index, options)
            )
        )

        return Object.assign(
            o,
            {
                reload: () => { }
            }
        )

    }

    async get<T>() {
        return {} as T
        // const response = await getDocs(
        //     collection(this.config.database, ref, ...this.#build_query_filters<T>(options))
        // )
        // return await this.#map_query_response<T>(response, 0, options)
    }

    async add<T extends {} = {}>(ref: string, data: Partial<T>): Promise<any> {
        const $ref = doc(this.config.database, ref)
        return await setDoc($ref, data as DocumentData) as any as T
    }

    async update<T extends {} = {}>(ref: string, data: Partial<T>, method: 'PATCH' | 'PUT' = 'PATCH'): Promise<any> {
        const $ref = doc(this.config.database, ref)
        return await setDoc($ref, data as DocumentData) as any as T
    }

    async remove(ref: string): Promise<void> {
        const $ref = doc(this.config.database, ref)
        await deleteDoc($ref)
    }

    async trigger<Response = void>(): Promise<Response> {
        throw new Error('NOT_IMPLEMENT')
    }
}