import Author from '../models/author'; // Adjust the import to your Author model path
import { getAuthorList } from '../pages/authors'; // Adjust the import to your function

// Goal is to mock the implementations of the Mongoose Models
// JEST Test:
describe('getAuthorList', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch and format the authors list correctly', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort (This is a stub)
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should format fullname as empty string if first name is absent', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: '',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors) // mockResolvedValue because Mongoose will return promises
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            ' : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should return an empty array when an error occurs', async () => {
        // Arrange: Mock the Author.find() method to throw an error
        Author.find = jest.fn().mockImplementation(() => { // mockImplementation allows us to mock errors w/o a Stub.
            // Stubs will replace the return value, mocking the method changes the functioning code
            throw new Error('Database error');
        });

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Verify the result is an empty array
        expect(result).toEqual([]);
    });

    it('should handle missing first or last names appropriately', async () => {
        // Define authors with various missing name combinations
        const sortedAuthors = [
            {
                first_name: '',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Charles',
                family_name: '',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        // Assert: Check if the result handles missing names correctly
        const expectedAuthors = [
            ' : 1775 - 1817',
            ' : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should handle missing date_of_birth appropriately', async () => {
        // Define authors with missing date_of_birth
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: null,
                date_of_death: new Date('1817-07-18')
            },
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        // Assert: Check if the result handles missing date_of_birth correctly
        const expectedAuthors = [
            'Austen, Jane :  - 1817'
        ];
        expect(result).toEqual(expectedAuthors);

        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should handle missing date_of_death appropriately', async () => {
        // Define authors with missing date_of_death
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: null
            },
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        // Assert: Check if the result handles missing date_of_death correctly
        const expectedAuthors = [
            'Austen, Jane : 1775 - '
        ];
        expect(result).toEqual(expectedAuthors);

        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });

    it('should handle authors with both date_of_birth and date_of_death missing', async () => {
        // Define authors with both dates missing
        const sortedAuthors = [
            {
                first_name: 'Charles',
                family_name: 'Dickens',
                date_of_birth: null,
                date_of_death: null
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const result = await getAuthorList();

        // Assert: Check if the result handles missing dates correctly
        const expectedAuthors = [
            'Dickens, Charles :  - '
        ];
        expect(result).toEqual(expectedAuthors);

        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);
    });
});
