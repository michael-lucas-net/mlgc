# MLGC (ML Git Changes)

MLGC is a CLI program that allows you to easily copy all Git changes to a folder for easy uploading or sharing.

## Installation

Install the package globally using npm:

```shell
npm install -g mlgc
```

## Usage

Run the program by calling `mlgc`. You can optionally use a parameter that specifies the path from the current location. If no parameter is provided, the current path will be used.

The program provides the following options:

1. Copy all uncommitted changes.
2. Copy all changes from the current branch to the main branch.
3. Delete the folder where the copied files are located.

## Example

Copy all changes of the current folder

```shell
mlgc
```

## Notes

- Make sure Git is installed on your system and that your path is a Git repository.
- Before running the program, ensure that you have the necessary permissions to copy or delete files in the target folder.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
