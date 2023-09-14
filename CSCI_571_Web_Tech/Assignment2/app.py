from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    print(my_flask_function())
    return "Hello, Flask!"

if __name__ == '__main__':
    # Change the port to your desired port number (e.g., 8080)
    app.run(debug=True, port=5500)


@app.route('/my-flask-function', methods=['GET'])
def my_flask_function():
    print('this is a testing')