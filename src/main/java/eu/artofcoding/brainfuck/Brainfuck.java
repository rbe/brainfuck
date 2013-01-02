package eu.artofcoding.brainfuck;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Brainfuck {

    /**
     * Array of Brainfuck commands.
     */
    private static char[] commands;

    private static int length;

    /**
     * Data.
     */
    private static int[] ptr = new int[30000];

    /**
     * Actual command frmo char[] commands.
     */
    private static int commandIdx = 0;

    /**
     * Actual cell in char[] ptr.
     */
    private static int cellIdx = 0;

    private static char[] readFile(Path path) throws IOException {
        byte[] _commands = Files.readAllBytes(path);
        char[] commands = new char[_commands.length];
        for (int i = 0; i < _commands.length; i++) {
            byte b = _commands[i];
            commands[i] = (char) b;
        }
        return commands;
    }

    private static void executeCommand() throws IOException {
        switch (commands[commandIdx]) {
            case '>':
                System.out.println("Move pointer >");
                ++cellIdx;
                if (cellIdx > ptr.length) {
                    throw new IllegalStateException("Operating on cell " + cellIdx);
                }
                break;
            case '<':
                System.out.println("Move pointer <");
                --cellIdx;
                if (cellIdx < 0) {
                    throw new IllegalStateException("Operating on cell " + cellIdx);
                }
                break;
            case '+': // Increment byte at actual cell
                System.out.printf("Increment cell %d(%s) by 1%n", cellIdx, ptr[cellIdx]);
                ptr[cellIdx] += 1;
                break;
            case '-': // Decrement byte at actual cell
                System.out.printf("Decrement cell %d(%s) by 1%n", cellIdx, ptr[cellIdx]);
                ptr[cellIdx] -= 1;
                break;
            case '.': // Print char to stdout
                System.out.print(ptr[cellIdx]);
                break;
            case ',': // Read char into actual cell from stdin
                ptr[cellIdx] = (char) System.in.read();
                break;
            default:
                break;
        }
    }

    public static void main(String[] args) throws IOException {
        String filename;
        if (args.length > 0) {
            filename = args[0];
            commands = readFile(Paths.get(filename));
        } else {
            commands = "++++++++++[>+++++++++>++++++++++>+++++++++++>+++<<<<-]>+++++++.>>++++.++.>++.<-----.<++.>>.<<<++.>>.<<+.+++++.>>-.<<--.".toCharArray();
        }
        length = commands.length;
        // 
        int loopCnt;
        while (commandIdx < length - 1) {
            switch (commands[commandIdx]) {
                case '[': // Begin loop
                    System.out.println("Enter loop");
//                    if (ptr[cellIdx] == 0) {
                        loopCnt = 1;
                        commandIdx++;
                    label:
                    while (loopCnt > 0) {
                        switch (commands[commandIdx]) {
                            case '[':
                                loopCnt++;
                                break;
                            case ']':
                                loopCnt--;
                                break;
                            default:
                                break label;
                        }
//                            commandIdx++;
                    }
//                    }
                    break;
                case ']': // End loop
                    System.out.println("Leave loop");
                    if (ptr[cellIdx] != 0) {
                        loopCnt = 1;
                        commandIdx--;
                        label1:
                        while (loopCnt > 0) {
                            switch (commands[commandIdx]) {
                                case '[':
                                    loopCnt--;
                                    break;
                                case ']':
                                    loopCnt++;
                                    break;
                                default:
                                    break label1;
                            }
                            commandIdx--;
                        }
                    }
                    break;
                default:
                    executeCommand();
                    break;
            }
            commandIdx++;
        }
        System.out.println();
    }

}
