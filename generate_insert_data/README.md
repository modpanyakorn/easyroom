# Generate Data
#### Configure datetime for generate booking requests.
in `gen.py`
```python
# กำหนดช่วงวันที่สำหรับการใช้ห้อง!!
start_date = datetime.date(2025, 3, 1)
end_date   = datetime.date(2025, 8, 31)

# กำหนดช่วงวันที่สำหรับการส่งคำขอ!!
submit_start_date = datetime.date(2025, 3, 1)
submit_end_date   = datetime.date(2025, 8, 31)
```
