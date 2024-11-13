import { Response } from "express";
import BookInstance from "../models/bookinstance";
import { showAllBooksStatus } from "../pages/books_status";

describe("showAllBooksStatus", () => {
    // Arrange: Prepare mock data and response object
    let res: Partial<Response>;
    const mockBookInstances = [
        { book: { title: "Mock Book Title" }, status: "Available" },
        { book: { title: "Mock Book Title 2" }, status: "Available" },
    ];
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return all books with status 'Available'", async () => {
        // Arrange: Mock the BookInstance model's find and populate methods
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockBookInstances)
        });
        BookInstance.find = mockFind;

        // Act: Call the function to show all books with status 'Available'
        await showAllBooksStatus(res as Response);

        // Assert: Check if the response is as expected
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([
            "Mock Book Title : Available",
            "Mock Book Title 2 : Available",
        ]);
    });

    it("should return empty list if no books are available", async () => {
        // Arrange: Mock the BookInstance model's find and populate methods
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });
        BookInstance.find = mockFind;

        // Act: Call the function to show all books with status 'Available'
        await showAllBooksStatus(res as Response);

        // Assert: Check if the response is as expected
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([]);
    });

    it("should return 500 if there is an error fetching book instances", async () => {
        const mockFind = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });
        BookInstance.find = mockFind;

        await showAllBooksStatus(res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Status not found');
    });

    it("should handle incomplete book instances with a 200 status", async () => {
        // Arrange: Mock incomplete book instances (missing title or status)
        const malformedInstances = [
            { book: {}, status: "Available" },
            { book: { title: "Mock Book Title" }, status: undefined },
        ];
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(malformedInstances)
        });
        BookInstance.find = mockFind;

        // Act
        await showAllBooksStatus(res as Response);

        // Assert
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([
            "undefined : Available",
            "Mock Book Title : undefined"
        ]);
    });

    it("should handle null book reference with code 500", async () => {
        // Arrange: Mock instance with null book reference
        const nullBookInstance = [
            { book: null, status: "Available" }
        ];
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(nullBookInstance)
        });
        BookInstance.find = mockFind;

        // Act
        await showAllBooksStatus(res as Response);

        // Assert
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Status not found');
    });

    it("should handle populate() rejection with code 500", async () => {
        // Arrange: Mock populate method rejection
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Populate failed'))
        });
        BookInstance.find = mockFind;

        // Act
        await showAllBooksStatus(res as Response);

        // Assert
        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Status not found');
    });
});