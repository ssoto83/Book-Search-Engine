import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { removeBookId } from '../utils/localStorage';
import Auth from '../utils/auth';

const SavedBooks = () => {
  const { loading, data, error: queryError } = useQuery(QUERY_ME);
  const [removeBook, { error: mutationError }] = useMutation(REMOVE_BOOK);

  const userData = data?.me || {};

  // Function to delete book by ID
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      alert('You need to be logged in to delete a book.');
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // Upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error("Failed to delete the book", err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  if (queryError) {
    return <h2 className="text-danger">Error loading user data. Please try again later.</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing {userData.username}'s books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        {/* Add a check to avoid mapping over undefined */}
        <Row>
          {userData.savedBooks && userData.savedBooks.length > 0 ? (
            userData.savedBooks.map((book) => (
              <Col key={book.bookId} md="4">
                <Card border="dark">
                  {book.image && (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                    {mutationError && (
                      <p className="text-danger mt-2">
                        Failed to delete the book. Please try again.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p>You have no saved books to display.</p>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
