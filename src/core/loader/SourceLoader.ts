import { ILoaderEngine, ISourceLoader } from '@/core/types/loader';

export class SourceLoader implements ISourceLoader {
    constructor(protected engine: ILoaderEngine) {
        this.engine = engine;
    }

    async load() {
        return await this.engine.load();
    }
}
