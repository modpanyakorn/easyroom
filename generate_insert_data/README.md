# Generate Data
#### Configure datetime for generate booking requests.
execute `gen.py`!
```python
# กำหนดช่วงวันที่สำหรับการใช้ห้อง!!
start_date = datetime.date(2025, 3, 1)
end_date   = datetime.date(2025, 8, 31)

# กำหนดช่วงวันที่สำหรับการส่งคำขอ!!
submit_start_date = datetime.date(2025, 3, 1)
submit_end_date   = datetime.date(2025, 8, 31)
```
output here \n
Insert the `room_request` table first! Because `primary key` from `room_requst` table is related to other tables.
- `room_request_inserts.sql` insert at `room_request` table
- `room_request_computer_insert.sql` insert at `room_request_computer` table
- `room_request_equipment_inserts.sql` insert at `room_request_equipment` table
- `room_request_participant_inserts.sql` insert at `room_request_participan` table
