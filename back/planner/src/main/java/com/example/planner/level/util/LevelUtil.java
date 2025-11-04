package com.example.planner.level.util;

import java.util.ArrayList;
import java.util.List;

public class LevelUtil {
    public static List<Integer> generateFibonacci(int n) {
        List<Integer> fib = new ArrayList<>();
        fib.add(1);
        fib.add(1);
        for (int i = 2; i < n; i++) {
            fib.add(fib.get(i - 1) + fib.get(i - 2));
        }
        return fib;
    }

    public static int getXPForLevel(int level) {
        List<Integer> fib = generateFibonacci(level + 1);
        return fib.get(level - 1);
    }
}
