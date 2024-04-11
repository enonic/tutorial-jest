import {jest} from '@jest/globals';


declare type Model = Record<string, unknown>;
declare type RenderFn = (
    _view: string,
    _model: Model,
    _options: Record<string, unknown>
) => Model;


jest.mock('/lib/thymeleaf', () => ({
    render: jest.fn<RenderFn>().mockImplementation((
        _view,
        model,
        // options
    ) => {
        return model; // Not testing the actual rendering, just that the model is correct.
    })
}), { virtual: true });