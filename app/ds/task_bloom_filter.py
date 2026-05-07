import hashlib
from bitarray import bitarray


class BloomFilter:
    def __init__(self, size: int = 100000, hash_count: int = 7):
        self.size = size
        self.hash_count = hash_count
        self.bit_array = bitarray(size)
        self.bit_array.setall(0)

    def _hashes(self, item: str):
        result = []
        for i in range(self.hash_count):
            hash_val = int(hashlib.md5(f"{item}{i}".encode()).hexdigest(), 16)
            result.append(hash_val % self.size)
        return result

    def add(self, task_title: str):
        for hash_val in self._hashes(task_title):
            self.bit_array[hash_val] = 1

    def contains(self, task_title: str) -> bool:
        for hash_val in self._hashes(task_title):
            if not self.bit_array[hash_val]:
                return False
        return True
