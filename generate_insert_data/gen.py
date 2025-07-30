import random
import datetime
import os
from Room import Room  # สมมุติว่า Room.py มีเมธอด get_room(room) ที่คืน room_schedule_data เป็น list

# ----------------------------
# ข้อมูลพื้นฐาน
# ----------------------------
user_accounts = [
    ('64312995', 'นิสิต'),
    ('65312994', 'นิสิต'),
    ('65312997', 'นิสิต'),
    ('CS653129', 'อาจารย์'),
    ('CS663129', 'อาจารย์'),
    ('CS673129', 'อาจารย์')
]

request_reasons = [
    "ขอใช้ห้องเพื่อติวหนังสือ",
    "ขอใช้ห้องเพื่อทำงาน",
    "ขอใช้ห้องเพื่อทำวิจัย",
    "ขอใช้ห้องเพื่อจัดกิจกรรมเสริมความรู้",
    "ขอใช้ห้องเพื่อกิจกรรมชมรม",
    "ขอใช้ห้องเพื่อเรียนออนไลน์",
    "ขอใช้ห้องเพื่อถ่ายทำวิดีโอ",
    "ขอใช้ห้องเพื่อวัตถุประสงค์อื่น ๆ"
]

# ----------------------------
# Parameter สำหรับ request_status แบบเปิด/ปิด และแบ่งสัดส่วน
# โดยสัดส่วนที่กำหนด (proportion) จะถูกใช้สุ่มเลือกสถานะตามน้ำหนักที่ระบุ
# ตัวอย่างนี้กำหนดให้ "รออนุมัติ" มีสัดส่วน 0.3 หมายถึง 30% 
# (คุณสามารถปรับค่า active และ proportion ได้ตามต้องการ)
# ----------------------------
request_status_config = {
    'รอดำเนินการ': {'active': True, 'proportion': 0.35},
    'รออนุมัติ': {'active': True, 'proportion': 0.35},   # 30%
    'ไม่อนุมัติ': {'active': True, 'proportion': 0.10},
    'อนุมัติ': {'active': True, 'proportion': 0.10},
    'ยกเลิกการจอง': {'active': True, 'proportion': 0.10}
}

def get_random_status():
    active_statuses = {status: conf['proportion'] for status, conf in request_status_config.items() if conf['active']}
    total = sum(active_statuses.values())
    rand_val = random.random() * total
    cumulative = 0
    for status, weight in active_statuses.items():
        cumulative += weight
        if rand_val < cumulative:
            return status
    return list(active_statuses.keys())[0]

reject_reasons = [
    'จำนวนคนใช้ห้องน้อยเกินไป',
    'เหตุผลในการขอใช้ห้องไม่สมเหตุสมผล',
    'คำขอซ้ำซ้อน',
    'ห้องมีการบำรุงรักษาหรือติดตั้งอุปกรณ์ใหม่',
    'มีการใช้ห้องผิดประเภท',
    'มีคำขออื่นถูกอนุมัติแล้ว'
]

request_detail_phrases = [
    "ต้องการใช้ห้องนี้เพื่อการเรียนรู้ต่าง ๆ ขอบคุณคะ",
    "เพื่อเตรียมตัวสำหรับการสอบและประชุมกลุ่มในงาน CSIT Contest",
    "มีความจำเป็นต้องใช้อุปกรณ์เฉพาะในห้องนี้สำหรับการทำ Lab Network ครับ",
    "เพื่อจัดกิจกรรมเสริมสร้างความรู้และทักษะในวิชา",
    "เตรียมตัวติวหนังสือให้เพื่อน ๆ",
    "เตรียมซ้อมกิจกรรมรับน้อง",
    "ประชุมกับเพื่อน ๆ ค่ะ"
]

reject_detail_phrases = [
    "เนื่องจากจำนวนผู้เข้าร่วมไม่เพียงพอ จึงไม่เหมาะสมกับการใช้ห้องนี้",
    "เหตุผลที่ระบุไม่สอดคล้องกับการจองห้อง",
    "พบว่ามีการจองซ้ำกันในช่วงเวลาที่มีการใช้งานจริงของห้อง",
    "พบว่าการใช้ห้องไม่ตรงกับวัตถุประสงค์ที่ระบุไว้",
    "เนื่องจากมีการใช้ห้องผิดประเภท ซึ่งไม่สามารถอนุมัติคำขอนี้ได้",
    "อุปกรณ์ที่ขอยืมไม่เพียงพอ"
]

# รายการนิสิต (student_id, full_name)
students = [
    ('64312995','สุกานดา ศรีประเสริฐ'),
    ('64312998','เกรียงไกร วิชชุภักดี'),
    ('64313001','พิมพ์ชนก ลีลาชัย'),
    ('64313005','รติพร บุญส่ง'),
    ('64313012','กิตติพงษ์ กองแก้ว'),
    ('65312994','สมหญิง รุ่งโรจน์'),
    ('65312997','นภัสวรรณ บัวทอง'),
    ('65313000','ธนากร สุดใจ'),
    ('65313003','ปิยาพร มั่นคง'),
    ('65313006','ดวงใจ กาญจนารักษ์'),
    ('65313009','ศิริรัตน์ สมบัติ'),
    ('66312993','สมชาย พันธ์ดี'),
    ('66312996','อภิชาติ สุขสม'),
    ('66313004','วัชรินทร์ ศรีนวล'),
    ('66313007','ธนาภัทร พานิช'),
    ('66313010','อมรเทพ ไชยวัฒน์'),
    ('67312999','เมธาวี จันทรา'),
    ('67313002','อรพรรณ แสงสุริยะ'),
    ('67313008','พุฒิพงษ์ เพ็ชรชม'),
    ('67313011','บุญช่วย ศรีสวัสดิ์')
]

# กำหนดช่วงวันที่สำหรับการใช้ห้อง!!
start_date = datetime.date(2025, 3, 1)
end_date   = datetime.date(2025, 8, 31)

# กำหนดช่วงวันที่สำหรับการส่งคำขอ!!
submit_start_date = datetime.date(2025, 3, 1)
submit_end_date   = datetime.date(2025, 8, 31)

# กำหนดช่วงวันที่ระหว่างวันส่งคำขอและวันที่ใช้งานจริง
minGapDate = 0   # ค่าต่ำสุดของวันที่ส่งคำขอก่อนวันใช้งาน (0 = ส่งในวันเดียวกันได้)
maxGapDate = 8  # ค่าสูงสุดของวันที่ส่งคำขอก่อนวันใช้งาน
gapDateBias = 0.7  # ค่าระหว่าง 0-1: ใกล้ 0 จะ bias ไปทาง minGapDate, ใกล้ 1 จะ bias ไปทาง maxGapDate

# ----------------------------
# Parameter สำหรับเลือกเวลาจองแบบสัดส่วน (แทน in_time_probability เดิม)
# กำหนดสัดส่วนสำหรับ "ในเวลา" และ "นอกเวลา" ให้รวมกันเป็น 1 (หรือ 100%)
# ตัวอย่างนี้กำหนดให้แต่ละแบบมีสัดส่วน 50%
# ----------------------------
time_slot_config = {
    'ในเวลา': 0.5,
    'นอกเวลา': 0.5
}

def get_random_time_slot():
    total = sum(time_slot_config.values())
    rand_val = random.random() * total
    cumulative = 0
    for slot, weight in time_slot_config.items():
        cumulative += weight
        if rand_val < cumulative:
            return slot
    return list(time_slot_config.keys())[0]

# กำหนดจำนวนคำขอต่อวันสำหรับห้องเดียวกัน
min_requests_per_day = 0  # จำนวนคำขอขั้นต่ำต่อวันต่อห้อง
max_requests_per_day = 8  # จำนวนคำขอสูงสุดต่อวันต่อห้อง
multiple_request_probability = 0.8  # ความน่าจะเป็นที่จะมีคำขอมากกว่า 1 คำขอในวันเดียวกัน

allowed_weekdays = [0, 1, 2, 3, 4]
weekday_map = {0: "จันทร์", 1: "อังคาร", 2: "พุธ", 3: "พฤหัสบดี", 4: "ศุกร์"}

# กำหนดห้องที่ต้องการสร้างข้อมูล
rooms_to_generate = ["307", "414"]

# ----------------------------
# Parameter ปรับเพิ่มโอกาส
# ----------------------------
participant_extra_probability = 0.9   # โอกาส 90% ที่จะเพิ่มผู้เข้าร่วม (เพื่อน) เมื่อผู้จองเป็นนิสิต
max_extra_participants = 7             # จำนวนผู้เข้าร่วมเพิ่มเติมสูงสุด

equipment_borrow_probability = 0.8     # โอกาส 80% ที่จะมีการขอยืมอุปกรณ์
max_equipment_items = 4                # จำนวนอุปกรณ์ที่ยืมได้สุ่มจาก 1 ถึง 4

computer_selection_probability = 0.8   # โอกาส 80% ที่จะเลือกคอมพิวเตอร์
computer_extra_range = 40              # จำนวนคอมพิวเตอร์เพิ่ม

# ----------------------------
# Parameter สำหรับการเลือกอุปกรณ์/คอมพิวเตอร์ ตามประเภทผู้จอง
# หากผู้จองเป็นอาจารย์ สามารถตั้งค่าให้ไม่ต้องเลือกอุปกรณ์และคอมพิวเตอร์ได้
teacher_includes_equipment = False
teacher_includes_computer = False
student_includes_equipment = True
student_includes_computer = True

# ----------------------------
# ฟังก์ชันช่วยแปลงเวลา
# ----------------------------
def time_to_minutes(time_str):
    h, m, s = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes):
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}:00"

def intervals_overlap(start1, end1, start2, end2):
    return not (end1 <= start2 or start1 >= end2)

# ฟังก์ชัน is_conflict_with_schedule ตรวจสอบกับตารางเรียน (จาก Room.py)
def is_conflict_with_schedule(room_schedule_data, date_obj, start_time_str, end_time_str, room):
    weekday_num = date_obj.weekday()
    if weekday_num > 4:
        return True
    thai_weekday = weekday_map[weekday_num]
    req_start = time_to_minutes(start_time_str)
    req_end = time_to_minutes(end_time_str)
    for sched in room_schedule_data:
        sched_room, sched_weekday, sched_date, sched_start_str, sched_end_str, sched_status = (
            sched[1], sched[2], sched[3], sched[4], sched[5], sched[6]
        )
        if sched_room == room and sched_weekday == thai_weekday:
            if sched_date is not None and sched_date != date_obj:
                continue
            sched_start = time_to_minutes(sched_start_str)
            sched_end = time_to_minutes(sched_end_str)
            if intervals_overlap(req_start, req_end, sched_start, sched_end):
                return True
    return False

# ฟังก์ชันสุ่มวันที่ส่งคำขอ
def random_submitted_date(used_date):
    if used_date < submit_start_date:
        return submit_start_date
    
    days_diff = (used_date - submit_start_date).days
    max_gap = min(maxGapDate, days_diff)
    
    if max_gap <= minGapDate:
        gap = minGapDate
    else:
        if random.random() < gapDateBias:
            weighted_range = max_gap - minGapDate
            weight = random.random() ** 0.5
            gap = minGapDate + int(weighted_range * weight)
        else:
            weighted_range = max_gap - minGapDate
            weight = random.random() ** 2
            gap = minGapDate + int(weighted_range * weight)
    
    submitted_date = used_date - datetime.timedelta(days=gap)
    
    if submitted_date > submit_end_date:
        return submit_end_date
    if submitted_date < submit_start_date:
        return submit_start_date
    
    return submitted_date

# ฟังก์ชันสร้างเวลาส่งคำขอ
def random_submitted_time():
    h = random.randint(6, 22)
    m = random.randint(0, 59)
    s = random.randint(0, 59)
    return f"{h:02d}:{m:02d}:{s:02d}"

# ฟังก์ชันสร้าง submitted_time แบบใหม่
def generate_submitted_datetime(used_date):
    submitted_date = random_submitted_date(used_date)
    submitted_time = random_submitted_time()
    return f"{submitted_date} {submitted_time}"

# ----------------------------
# Approved intervals: key = (room, used_date), value = list of (start_minutes, end_minutes)
approved_intervals = {}

# ----------------------------
# เตรียมรายชื่อ INSERT สำหรับแต่ละตาราง
# ----------------------------
all_room_request_inserts = []
all_participant_inserts = []
all_equipment_inserts = []
all_computer_inserts = []

# จำลองข้อมูล equipment_management (ตัวอย่าง)
equipment_management_data = {
    "307": [
        (12, '307', 3),
        (13, '307', 10),
        (14, '307', 7),
        (15, '307', 5)
    ],
    "414": [
        (12, '414', 5),
        (13, '414', 4),
        (14, '414', 20),
        (15, '414', 7)
    ]
}

# จำลองข้อมูล computer_management: สมมุติใน production มี 80 เครื่อง
computer_management_data = {
    "307": [
        (1, '307', 'ใช้งานได้'),
        (2, '307', 'ใช้งานได้'),
        (3, '307', 'ใช้งานได้'),
        (4, '307', 'ใช้งานไม่ได้'),
        (5, '307', 'ใช้งานไม่ได้'),
        (6, '307', 'ใช้งานไม่ได้'),
        (7, '307', 'ใช้งานได้'),
        (8, '307', 'ใช้งานได้'),
        (9, '307', 'ใช้งานได้'),
        (10, '307', 'ใช้งานไม่ได้'),
        (11, '307', 'ใช้งานได้'),
        (12, '307', 'ใช้งานได้'),
        (13, '307', 'ใช้งานได้'),
        (14, '307', 'ใช้งานได้'),
        (15, '307', 'ใช้งานได้'),
        (16, '307', 'ใช้งานได้'),
        (17, '307', 'ใช้งานได้'),
        (18, '307', 'ใช้งานได้'),
        (19, '307', 'ใช้งานได้'),
        (20, '307', 'ใช้งานได้'),
        (21, '307', 'ใช้งานได้'),
        (22, '307', 'ใช้งานได้'),
        (23, '307', 'ใช้งานได้'),
        (24, '307', 'ใช้งานได้'),
        (25, '307', 'ใช้งานไม่ได้'),
        (26, '307', 'ใช้งานไม่ได้'),
        (27, '307', 'ใช้งานได้'),
        (28, '307', 'ใช้งานได้'),
        (29, '307', 'ใช้งานได้'),
        (30, '307', 'ใช้งานได้'),
        (31, '307', 'ใช้งานได้'),
        (32, '307', 'ใช้งานได้'),
        (33, '307', 'ใช้งานได้'),
        (34, '307', 'ใช้งานได้'),
        (35, '307', 'ใช้งานได้'),
        (36, '307', 'ใช้งานได้'),
        (37, '307', 'ใช้งานได้'),
        (38, '307', 'ใช้งานได้'),
        (39, '307', 'ใช้งานได้'),
        (40, '307', 'ใช้งานได้'),
        (41, '307', 'ใช้งานได้'),
        (42, '307', 'ใช้งานได้'),
        (43, '307', 'ใช้งานได้'),
        (44, '307', 'ใช้งานได้'),
        (45, '307', 'ใช้งานได้'),
        (46, '307', 'ใช้งานได้'),
        (47, '307', 'ใช้งานได้'),
        (48, '307', 'ใช้งานได้'),
        (49, '307', 'ใช้งานได้'),
        (50, '307', 'ใช้งานได้'),
        (51, '307', 'ใช้งานได้'),
        (52, '307', 'ใช้งานได้'),
        (53, '307', 'ใช้งานได้'),
        (54, '307', 'ใช้งานได้'),
        (55, '307', 'ใช้งานได้'),
        (56, '307', 'ใช้งานได้'),
        (57, '307', 'ใช้งานได้'),
        (58, '307', 'ใช้งานได้'),
        (59, '307', 'ใช้งานได้'),
        (60, '307', 'ใช้งานได้'),
        (61, '307', 'ใช้งานได้'),
        (62, '307', 'ใช้งานได้'),
        (63, '307', 'ใช้งานได้'),
        (64, '307', 'ใช้งานได้'),
        (65, '307', 'ใช้งานได้'),
        (66, '307', 'ใช้งานได้'),
        (67, '307', 'ใช้งานได้'),
        (68, '307', 'ใช้งานได้'),
        (69, '307', 'ใช้งานได้'),
        (70, '307', 'ใช้งานได้'),
        (71, '307', 'ใช้งานได้'),
        (72, '307', 'ใช้งานได้'),
        (73, '307', 'ใช้งานได้'),
        (74, '307', 'ใช้งานได้'),
        (75, '307', 'ใช้งานได้'),
        (76, '307', 'ใช้งานได้'),
        (77, '307', 'ใช้งานได้'),
        (78, '307', 'ใช้งานได้'),
        (79, '307', 'ใช้งานไม่ได้'),
        (80, '307', 'ใช้งานได้')
    ],
    "414": [
        (1, '414', 'ใช้งานได้'),
        (2, '414', 'ใช้งานได้'),
        (3, '414', 'ใช้งานได้'),
        (4, '414', 'ใช้งานได้'),
        (5, '414', 'ใช้งานได้'),
        (6, '414', 'ใช้งานได้'),
        (7, '414', 'ใช้งานได้'),
        (8, '414', 'ใช้งานได้'),
        (9, '414', 'ใช้งานได้'),
        (10, '414', 'ใช้งานไม่ได้'),
        (11, '414', 'ใช้งานได้'),
        (12, '414', 'ใช้งานได้'),
        (13, '414', 'ใช้งานได้'),
        (14, '414', 'ใช้งานได้'),
        (15, '414', 'ใช้งานได้'),
        (16, '414', 'ใช้งานได้'),
        (17, '414', 'ใช้งานได้'),
        (18, '414', 'ใช้งานได้'),
        (19, '414', 'ใช้งานได้'),
        (20, '414', 'ใช้งานได้'),
        (21, '414', 'ใช้งานได้'),
        (22, '414', 'ใช้งานได้'),
        (23, '414', 'ใช้งานได้'),
        (24, '414', 'ใช้งานได้'),
        (25, '414', 'ใช้งานไม่ได้'),
        (26, '414', 'ใช้งานได้'),
        (27, '414', 'ใช้งานได้'),
        (28, '414', 'ใช้งานได้'),
        (29, '414', 'ใช้งานได้'),
        (30, '414', 'ใช้งานได้'),
        (31, '414', 'ใช้งานได้'),
        (32, '414', 'ใช้งานได้'),
        (33, '414', 'ใช้งานได้'),
        (34, '414', 'ใช้งานได้'),
        (35, '414', 'ใช้งานได้'),
        (36, '414', 'ใช้งานได้'),
        (37, '414', 'ใช้งานได้'),
        (38, '414', 'ใช้งานได้'),
        (39, '414', 'ใช้งานได้'),
        (40, '414', 'ใช้งานได้'),
        (41, '414', 'ใช้งานได้'),
        (42, '414', 'ใช้งานได้'),
        (43, '414', 'ใช้งานได้'),
        (44, '414', 'ใช้งานได้'),
        (45, '414', 'ใช้งานได้'),
        (46, '414', 'ใช้งานได้'),
        (47, '414', 'ใช้งานไม่ได้'),
        (48, '414', 'ใช้งานได้'),
        (49, '414', 'ใช้งานได้'),
        (50, '414', 'ใช้งานได้'),
        (51, '414', 'ใช้งานได้'),
        (52, '414', 'ใช้งานได้'),
        (53, '414', 'ใช้งานได้'),
        (54, '414', 'ใช้งานได้'),
        (55, '414', 'ใช้งานได้'),
        (56, '414', 'ใช้งานได้'),
        (57, '414', 'ใช้งานได้'),
        (58, '414', 'ใช้งานได้'),
        (59, '414', 'ใช้งานได้'),
        (60, '414', 'ใช้งานไม่ได้'),
        (61, '414', 'ใช้งานได้'),
        (62, '414', 'ใช้งานได้'),
        (63, '414', 'ใช้งานได้'),
        (64, '414', 'ใช้งานได้'),
        (65, '414', 'ใช้งานได้'),
        (66, '414', 'ใช้งานได้'),
        (67, '414', 'ใช้งานได้'),
        (68, '414', 'ใช้งานได้'),
        (69, '414', 'ใช้งานได้'),
        (70, '414', 'ใช้งานได้'),
        (71, '414', 'ใช้งานได้'),
        (72, '414', 'ใช้งานได้'),
        (73, '414', 'ใช้งานได้'),
        (74, '414', 'ใช้งานได้'),
        (75, '414', 'ใช้งานได้'),
        (76, '414', 'ใช้งานได้'),
        (77, '414', 'ใช้งานไม่ได้'),
        (78, '414', 'ใช้งานไม่ได้'),
        (79, '414', 'ใช้งานไม่ได้'),
        (80, '414', 'ใช้งานได้')
    ]
}

room_request_id = 1

# ----------------------------
# สำหรับ admin และ executive
# ----------------------------
admin_ids = ["ADCS5624", "ADCS7823"]
executive_id_fixed = "CSB25645"  # จากข้อมูล executive

for room in rooms_to_generate:
    # ดึงตารางเรียนของห้องนั้นจาก Room.py
    room_schedule_data = Room().get_room(room)
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() in allowed_weekdays:
            key = (room, current_date)
            if key not in approved_intervals:
                approved_intervals[key] = []
                
            # กำหนดจำนวนคำขอสำหรับวันนี้ตาม parameter
            if random.random() < multiple_request_probability:
                num_requests_today = random.randint(min_requests_per_day, max_requests_per_day)
            else:
                num_requests_today = random.randint(min_requests_per_day, min(1, max_requests_per_day))
                
            for _ in range(num_requests_today):
                attempts = 0
                valid_slot_found = False
                # เลือกเวลาจองเป็นชั่วโมงเต็ม (ไม่มีนาที 30)
                # ใช้ฟังก์ชัน get_random_time_slot() ที่เลือกแบบสุ่มตามสัดส่วนที่กำหนด
                time_slot_type = get_random_time_slot()
                while attempts < 5 and not valid_slot_found:
                    if time_slot_type == "ในเวลา":
                        start_h = random.randint(8, 16)
                        start_m = 0
                        duration = random.randint(1, 2)
                        end_h = start_h + duration
                        if end_h > 17:
                            end_h = 17
                    else:  # "นอกเวลา"
                        start_h = random.randint(17, 21)
                        start_m = 0
                        duration = random.randint(1, 2)
                        end_h = start_h + duration
                        if end_h > 22:
                            end_h = 22
                    start_time_str = f"{start_h:02d}:{start_m:02d}:00"
                    end_time_str = f"{end_h:02d}:{start_m:02d}:00"
                    
                    if not is_conflict_with_schedule(room_schedule_data, current_date, start_time_str, end_time_str, room):
                        new_start = time_to_minutes(start_time_str)
                        new_end = time_to_minutes(end_time_str)
                        conflict_found = False
                        for (a_start, a_end) in approved_intervals.get(key, []):
                            if intervals_overlap(new_start, new_end, a_start, a_end):
                                conflict_found = True
                                break
                        if not conflict_found:
                            valid_slot_found = True
                        else:
                            attempts += 1
                    else:
                        attempts += 1
                        
                if not valid_slot_found:
                    continue

                submitted_time_str = generate_submitted_datetime(current_date)
                user_id, user_type = random.choice(user_accounts)
                if user_type == "นิสิต":
                    student_id = user_id
                    teacher_id = None
                else:
                    student_id = None
                    teacher_id = user_id

                reason = random.choice(request_reasons)
                detail_reason = random.choice(request_detail_phrases) if random.random() < 0.5 else None
                status = get_random_status()
                
                reject_rsn = None
                detail_reject_rsn = None

                new_start = time_to_minutes(start_time_str)
                new_end = time_to_minutes(end_time_str)
                if status == "อนุมัติ":
                    conflict_found = False
                    for (a_start, a_end) in approved_intervals.get(key, []):
                        if intervals_overlap(new_start, new_end, a_start, a_end):
                            conflict_found = True
                            break
                    if conflict_found:
                        status = "ไม่อนุมัติ"
                        reject_rsn = 'มีคำขออื่นถูกอนุมัติแล้ว'
                        detail_reject_rsn = random.choice(reject_detail_phrases) if random.random() < 0.3 else None
                    else:
                        approved_intervals[key].append((new_start, new_end))
                elif status == "ไม่อนุมัติ":
                    reject_rsn = random.choice(reject_reasons)
                    detail_reject_rsn = random.choice(reject_detail_phrases) if random.random() < 0.3 else None

                if status in ["อนุมัติ", "ไม่อนุมัติ"]:
                    if time_slot_type == "ในเวลา":
                        admin_id_val = random.choice(admin_ids)
                        executive_id_val = None
                    else:
                        admin_id_val = None
                        executive_id_val = executive_id_fixed
                else:
                    admin_id_val = None
                    executive_id_val = None

                rr_sql = f"""
INSERT INTO room_request (
  room_request_id,
  submitted_time,
  room_id,
  student_id,
  teacher_id,
  used_date,
  start_time,
  end_time,
  request_type,
  admin_id,
  executive_id,
  request_reason,
  detail_request_reason,
  reject_reason,
  detail_reject_reason,
  request_status
) VALUES (
  {room_request_id},
  '{submitted_time_str}',
  '{room}',
  {f"'{student_id}'" if student_id else 'NULL'},
  {f"'{teacher_id}'" if teacher_id else 'NULL'},
  '{current_date}',
  '{start_time_str}',
  '{end_time_str}',
  '{time_slot_type}',
  {f"'{admin_id_val}'" if admin_id_val else 'NULL'},
  {f"'{executive_id_val}'" if executive_id_val else 'NULL'},
  '{reason}',
  {f"'{detail_reason}'" if detail_reason else 'NULL'},
  {f"'{reject_rsn}'" if reject_rsn else 'NULL'},
  {f"'{detail_reject_rsn}'" if detail_reject_rsn else 'NULL'},
  '{status}'
);
                """.strip()
                all_room_request_inserts.append(rr_sql)

                if student_id:
                    pr_sql = f"""
INSERT INTO room_request_participant (
  room_request_id,
  student_id,
  teacher_id,
  role
) VALUES (
  {room_request_id},
  '{student_id}',
  NULL,
  'ผู้ขอใช้'
);
                    """.strip()
                    all_participant_inserts.append(pr_sql)
                    if time_slot_type == "นอกเวลา":
                        if random.random() < participant_extra_probability:
                            extra = random.randint(1, max_extra_participants)
                            available = [sid for sid, name in students if sid != student_id]
                            for _ in range(extra):
                                friend = random.choice(available)
                                friend_sql = f"""
INSERT INTO room_request_participant (
  room_request_id,
  student_id,
  teacher_id,
  role
) VALUES (
  {room_request_id},
  '{friend}',
  NULL,
  'ผู้เข้าร่วม'
);
                                """.strip()
                                all_participant_inserts.append(friend_sql)
                else:
                    pr_sql = f"""
INSERT INTO room_request_participant (
  room_request_id,
  student_id,
  teacher_id,
  role
) VALUES (
  {room_request_id},
  NULL,
  '{teacher_id}',
  'ผู้ขอใช้'
);
                    """.strip()
                    all_participant_inserts.append(pr_sql)

                if (student_id and student_includes_equipment) or (teacher_id and teacher_includes_equipment):
                    if random.random() < equipment_borrow_probability:
                        eq_list = equipment_management_data.get(room, [])
                        if eq_list:
                            desired_eq_count = random.randint(1, max_equipment_items)
                            if desired_eq_count > len(eq_list):
                                desired_eq_count = len(eq_list)
                            selected_eq = random.sample(eq_list, desired_eq_count)
                            for eq in selected_eq:
                                equipment_id, eq_room, stock_quantity = eq
                                req_qty = random.randint(1, stock_quantity)
                                eq_sql = f"""
INSERT INTO room_request_equipment (
  room_request_id,
  equipment_id,
  request_quantity,
  room_id
) VALUES (
  {room_request_id},
  {equipment_id},
  {req_qty},
  '{room}'
);
                                """.strip()
                                all_equipment_inserts.append(eq_sql)

                if (student_id and student_includes_computer) or (teacher_id and teacher_includes_computer):
                    if random.random() < computer_selection_probability:
                        comp_list = computer_management_data.get(room, [])
                        available_computers = [comp for comp in comp_list if comp[2] == 'ใช้งานได้']
                        if available_computers:
                            desired_count = random.randint(1, 1 + computer_extra_range)
                            if desired_count > len(available_computers):
                                desired_count = len(available_computers)
                            selected_computers = random.sample(available_computers, desired_count)
                            for comp in selected_computers:
                                computer_id, comp_room, comp_status = comp
                                comp_sql = f"""
INSERT INTO room_request_computer (
  room_request_id,
  computer_id,
  room_id
) VALUES (
  {room_request_id},
  {computer_id},
  '{room}'
);
                                """.strip()
                                all_computer_inserts.append(comp_sql)

                room_request_id += 1
        current_date += datetime.timedelta(days=1)

with open(rf"{os.path.dirname(os.path.abspath(__file__))}/room_request_inserts.sql", "w", encoding="utf8") as f:
    for stmt in all_room_request_inserts:
        f.write(stmt + "\n")

with open(rf"{os.path.dirname(os.path.abspath(__file__))}/room_request_participant_inserts.sql", "w", encoding="utf8") as f:
    for stmt in all_participant_inserts:
        f.write(stmt + "\n")

with open(rf"{os.path.dirname(os.path.abspath(__file__))}/room_request_equipment_inserts.sql", "w", encoding="utf8") as f:
    for stmt in all_equipment_inserts:
        f.write(stmt + "\n")

with open(rf"{os.path.dirname(os.path.abspath(__file__))}/room_request_computer_insert.sql", "w", encoding="utf8") as f:
    for stmt in all_computer_inserts:
        f.write(stmt + "\n")

print(f"Generated {len(all_room_request_inserts)} room_request INSERT statements.")
print(f"Generated {len(all_participant_inserts)} room_request_participant INSERT statements.")
print(f"Generated {len(all_equipment_inserts)} room_request_equipment INSERT statements.")
print(f"Generated {len(all_computer_inserts)} room_request_computer INSERT statements.")
