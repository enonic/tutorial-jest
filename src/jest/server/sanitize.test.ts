import type { sanitize as sanitizeType } from '@enonic-types/lib-common';


import {
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';


jest.mock('/lib/xp/common', () => ({
    sanitize: jest.fn<typeof sanitizeType>().mockImplementation((text) => text
        .toLowerCase()
        .replace('ñ', 'n')
        .replace('ø', 'o')
        .replace('æ', 'ae')
        .replace(/[()']+/, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/, '')
    )
}), { virtual: true });


describe('sanitize', () => {
    it('should remove, replace or fold "illegal" characters', () => {
        import('/lib/myproject/sanitize').then(({sanitize}) => {
            expect(sanitize("Piña CØLADÆ <script>alert('hi!');</script>"))
                .toEqual('pina-coladae-script-alerthi-script');
        });
    });
});
